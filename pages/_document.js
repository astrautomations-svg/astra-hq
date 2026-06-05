import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <link rel="icon" href="/favicon.ico" type="image/png"/>
        <link rel="shortcut icon" href="/favicon.ico" type="image/png"/>
        <meta name="theme-color" content="#04060e"/>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
