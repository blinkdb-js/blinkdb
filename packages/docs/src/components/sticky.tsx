import { ReactNode } from "react";
import StickyBox from "react-sticky-box";

export default function Sticky(props: { children?: ReactNode, className?: string }) {
  return (
    <StickyBox className={props.className}>
      {props.children}
    </StickyBox>
  );
};