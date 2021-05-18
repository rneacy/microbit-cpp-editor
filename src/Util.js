import { useEffect, useLayoutEffect, useRef } from 'react'

export const useEffectFirstChange = (func, deps) => {
    const first = useRef(false);

    useLayoutEffect(() => {
        if(first.current) {
            const unmount = func();
            return () => unmount && unmount();
        }
        else {
            first.current = true;
        }
// eslint-disable-next-line
    }, deps);

    useEffect(() => {
        return () => first.current = false;
    }, []);
}

export const logAsModule = (mod, msg) => console.log(`[${mod}] ${msg}`);