import React from "react";

export type SVGProps = React.ComponentPropsWithRef<"svg"> & {
  size?: number;
};

export interface JwkOptions {
  use?: string;
  key_ops?: string[];
  kid?: string;
}