
import { headers } from 'next/headers';
import TestCmp from './TestCmp';
// import TestCmp from './TestCmp';
// import { ServerUrlMaker } from '@/src/lib/serverUtils';

type Props = {};

export default async function page({}: Props) {
    const headersList = await headers();
    const xff = headersList.get('x-forwarded-for');

    return (
        <div dir="ltr" className="mt-16 flex min-h-dvh flex-col items-center justify-center bg-red-400">

            <TestCmp />
        </div>
    );
}
