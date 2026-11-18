# Sending telemetry to a collector

From v0.1.0-rc.7 the product's services can export traces, metrics and, if you turn them on, logs
over OTLP to an OpenTelemetry collector you run. You set the collector on the **Telemetry** page in
the product's section of the `:8443` admin. Export is off until you turn it on.

## Before you start

- You can sign in to the appliance admin at `https://<address>:8443` and you have your
  authenticator app. Saving asks for a fresh code.
- Your appliance runs the v0.1.0-rc.7 Base OS or newer. On an older one, a product update that reads
  these settings is refused before anything is applied. Update the Base OS first, as in
  [Updating the appliance](./appliance-updates-guide.md).
- You have a collector reachable from the box, such as `https://collector.example.org:4317`. It
  takes OTLP over gRPC with TLS. Run it beside the box, not on it.

## Set the collector

1. Open **Telemetry** and fill in the settings:

   | Setting | What it does |
   |---|---|
   | Export | Turns the export on or off. Off keeps the endpoint. |
   | Endpoint | The collector's address, `https://<host>[:<port>]`, normally port 4317. `http://` is refused. |
   | Verify the certificate | On by default. Checks the collector's certificate. |
   | Collector CA | A PEM CA, for a collector signed by a private CA. The services trust it in place of the system roots. |
   | Logs | Exports logs as well. Off by default. |

2. Select **Save** and enter a fresh authenticator code.

The box first makes a TLS connection to the collector, the same way the services will. If that
fails, nothing is saved. When the save goes through, the services restart in order, without the
product stopping. A phase has 5 minutes. If a phase doesn't come back, the run stops and later
phases keep the old settings; select **Retry** to carry on from that phase.

The page shows each service as `sending`, `issue`, `off` or `unknown`. A collector that is down
shows as `issue` and doesn't fail the product's readiness.

## What leaves the box

With **Verify the certificate** off, anyone between the box and the collector can read traces and
metrics or pose as the collector, so use a certificate the box trusts or set the collector's CA. No
logs leave while verification is off.

Logs are limited to named fields, with values scrubbed. Audit entries, secret values and session
content are never exported.
