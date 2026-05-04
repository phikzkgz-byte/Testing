export const metadata = {
  title: 'Meu Projeto',
  description: 'Projeto Next.js para Vercel'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}