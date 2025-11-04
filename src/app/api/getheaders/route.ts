import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    // Try to detect client public IP from common proxy/CDN headers
    const getClientIp = (): string | undefined => {
        const headerCandidates = [
            "x-forwarded-for", // standard behind proxies (may be a list)
            "x-real-ip", // nginx/ingress
            "cf-connecting-ip", // Cloudflare
            "true-client-ip", // Akamai
            "x-vercel-forwarded-for", // Vercel
            "x-client-ip",
            "fastly-client-ip",
        ];

        for (const headerName of headerCandidates) {
            const value = req.headers.get(headerName);
            if (!value) continue;
            // x-forwarded-for can be a comma-separated list: client, proxy1, proxy2
            const first = value.split(",")[0]?.trim();
            if (first) return first;
        }
        return undefined;
    };

    const headersObject: Record<string, string> = {};
    req.headers.forEach((value, key) => {
        headersObject[key] = value;
    });

    const clientIp = getClientIp();

    return NextResponse.json({ res: true, clientIp, headers: headersObject });
}