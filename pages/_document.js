import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <link rel="icon" href="/favicon.ico" type="image/png"/>
        <link rel="shortcut icon" href="/favicon.ico" type="image/png"/>
        <meta name="theme-color" content="#05080f"/>
        <link rel="manifest" href="/manifest.json"/>
        <link rel="apple-touch-icon" href="/astra-icon-192.png"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        <meta name="apple-mobile-web-app-title" content="Astra HQ"/>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
