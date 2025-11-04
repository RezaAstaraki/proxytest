"use server";
import { headers } from "next/headers";

/**
 * Extracts the client IP address from request headers
 * Checks multiple headers in order of preference:
 * 1. cf-connecting-ip (Cloudflare)
 * 2. x-real-ip
 * 3. x-forwarded-for (takes first IP if multiple)
 */
function getClientIP(headersList: Headers): string | null {
  // Check Cloudflare header first
  const cfIP = headersList.get("cf-connecting-ip");
  if (cfIP) return cfIP.trim();

  // Check x-real-ip
  const realIP = headersList.get("x-real-ip");
  if (realIP) return realIP.trim();

  // Check x-forwarded-for (can contain multiple IPs separated by commas)
  const xff = headersList.get("x-forwarded-for");
  if (xff) {
    // Take the first IP (original client IP)
    const ips = xff.split(",");
    const firstIP = ips[0]?.trim();
    
    if (!firstIP) return null;
    
    // Handle IPv6-mapped IPv4 addresses (::ffff:xxx.xxx.xxx.xxx)
    if (firstIP.startsWith("::ffff:")) {
      return firstIP.replace("::ffff:", "");
    }
    
    return firstIP;
  }

  return null;
}

export const ipFetcherAction = async () => {
  "use server";
  const headersList = await headers();
  const allHeaders = Object.fromEntries(headersList.entries());
  return allHeaders;
};

export const ipFetcherActionXFF = async (clientIpFromBrowser?: string) => {
  const headersList = await headers();

  // Get all IP-related headers
  const xff = headersList.get("x-forwarded-for");
  const cfIP = headersList.get("cf-connecting-ip");
  const realIP = headersList.get("x-real-ip");
  
  // Try to extract client IP from headers
  const clientIP = getClientIP(headersList);

//   console.log("---------------");
//   // Convert the Headers object to a plain JS object
//   const allHeaders = Object.fromEntries(headersList.entries());
//   console.log(allHeaders);
//   console.log("---------------");

//   console.log("xff in server action", xff);
//   console.log("extracted client IP from headers:", clientIP);

  // If client IP was provided by the browser, prefer that immediately
  if (clientIpFromBrowser) {
    return {
      ip: clientIpFromBrowser,
      'x-forwarded-for': xff,
      'cf-connecting-ip': cfIP,
      'x-real-ip': realIP,
      extractedClientIP: clientIP,
      routerResponse: undefined,
      source: 'client-param',
    };
  }

  // Since headers might only have proxy IP, try fetching from router endpoint
  // with the x-forwarded-for header to see if backend can extract real IP
  try {
    const res = await fetch("https://credit-api.tavanapay.ir/v2/router", {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        // Forward the x-forwarded-for header so backend can see it
        ...(xff && { "X-Forwarded-For": xff }),
      },
    });
    const routerResponse = await res.json();
    console.log("router endpoint response:", routerResponse);
    
    // Return both the header-extracted IP and the router response
    return {
      ip: routerResponse.ip || clientIP,
      'x-forwarded-for': xff,
      'cf-connecting-ip': cfIP,
      'x-real-ip': realIP,
      extractedClientIP: clientIP,
      routerResponse: routerResponse,
    };
  } catch (error) {
    console.error("Error fetching from router:", error);
    return {
      ip: clientIP,
      'x-forwarded-for': xff,
      'cf-connecting-ip': cfIP,
      'x-real-ip': realIP,
      extractedClientIP: clientIP,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
