/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("trust", "routes/trust.tsx"),
  route("trust/security-review", "routes/security-review.tsx"),
] satisfies RouteConfig;
