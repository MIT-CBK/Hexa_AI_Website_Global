import { buildApp } from "./app.js"
import { bootstrap } from "./bootstrap.js"
import { env, smtpEnabled } from "./env.js"

async function main() {
  const app = await buildApp()
  try {
    await bootstrap(app.log)
    await app.listen({ port: env.PORT, host: env.HOST })
    app.log.info(`SMTP ${smtpEnabled ? "configured" : "not configured — contact emails will be skipped"}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }

  for (const sig of ["SIGINT", "SIGTERM"] as const) {
    process.on(sig, () => {
      app.log.info(`${sig} received, shutting down…`)
      void app.close().then(() => process.exit(0))
    })
  }
}

void main()
