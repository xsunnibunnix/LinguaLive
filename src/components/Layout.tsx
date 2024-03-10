import Nav from "./navbar/Nav";

export const metadata = {
  title: 'LinguaLive',
  description: 'Practice a language and connect with friends',
};

type LayoutProps = {
  children: React.ReactNode,
}

const Layout = ({children}: LayoutProps) => {
  return (
    <>
      <main className='app'>
        <Nav />
        {children}
      </main>
    </>
  )
}

export default Layout;