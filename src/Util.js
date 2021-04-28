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
    }, deps);

    useEffect(() => {
        return () => first.current = false;
    }, []);
}