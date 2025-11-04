'use client';

// import { ipFetcherAction, ipFetcherActionXFF } from '@/actions/test/action';
// import { clientUrlMaker } from '@/src/lib/clientUtils';
// import { ServerUrlMaker } from '@/src/lib/serverUtils';
import { useEffect, useState } from 'react';
import { ipFetcherAction, ipFetcherActionXFF, fetchExternalHeadersAction, ipFetcherAction2 } from '../../../actions/test/action';

type Props = {};

export default function TestCmp({}: Props) {
    const [response, setResponse] = useState<any>();
    const [response2, setResponse2] = useState<any>();
    const [response3, setResponse3] = useState<Awaited<ReturnType<any>> | undefined>();
    const [response4, setResponse4] = useState<Record<string, string> | undefined>(undefined);

    const fetcher = async () => {
        const js = await fetchExternalHeadersAction();
        setResponse(js);
    };
    const fetcher2 = async () => {
        const res = await ipFetcherAction();
        console.log('res fetcher 2',res)
        setResponse2(res);
    };

    const fetcher4 = async () => {
        const res = await ipFetcherAction2();

        setResponse4(res);
    };


    useEffect(() => {
        fetcher();
        fetcher2();
        fetcher4();
    }, []);


    return (
        <div className="flex flex-col items-center justify-center">
            <div className="border max-w-[400px]">
                <p>client side</p>
                <pre>{JSON.stringify(response, null, 4)}</pre>
            </div>
            <div className="border max-w-dvw">
                <hr />
                <p>server action</p>
                <pre className='scroll-auto'>{JSON.stringify(response2, null, 4)}</pre>
            </div>
            <div className="border max-w-dvw">
                <hr />
                <p>headers that server action get</p>
                <pre>{JSON.stringify(response4, null, 4)}</pre>
            </div>
        </div>
    );
}
