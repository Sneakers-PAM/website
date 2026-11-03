/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import "./marketing.css";

// The light mark and the dark one (the same file the docs site uses); the
// theme tokens in app.css show one and hide the other.
export const Mark = ({ size }: { size: number }) => (
  <>
    <img className="mark mark--light" src={`${import.meta.env.BASE_URL}img/mark-light.svg`} width={size} height={size} alt="" />
    <img className="mark mark--dark" src={`${import.meta.env.BASE_URL}img/mark-dark.svg`} width={size} height={size} alt="" />
  </>
);
