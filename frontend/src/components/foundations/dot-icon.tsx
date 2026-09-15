import type { HTMLAttributes } from "react";

const sizes = {
    sm: {
        wh: 8,
        c: 4,
        r: 2.5,
    },
    md: {
        wh: 10,
        c: 5,
        r: 4,
    },
};

export const Dot = ({ size = "md", ...props }: HTMLAttributes<HTMLOrSVGElement> & { size?: "sm" | "md" }) => {
    const s = sizes[size] || sizes.md;
    return (
        <svg width={s.wh} height={s.wh} viewBox={`0 0 ${s.wh} ${s.wh}`} fill="none" {...props}>
            <circle cx={s.c} cy={s.c} r={s.r} fill="currentColor" stroke="currentColor" />
        </svg>
    );
};
