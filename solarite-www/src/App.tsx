import React, { useCallback, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { UseWalletProvider } from "use-wallet";

import MobileMenu from "./components/MobileMenu";
import TopBar from "./components/TopBar";

import ProposalsProvider from "./contexts/Proposals";
import FarmsProvider from "./contexts/Farms";
import ModalsProvider from "./contexts/Modals";
import SolariteProvider from "./contexts/SolariteProvider";
import TransactionProvider from "./contexts/Transactions";

import Farms from "./views/Farms";
// import Vote from './views/Vote'
import Home from "./views/Home";
import Statics from "./views/Statics";
import theme from "./theme";

const App: React.FC = () => {
  const [mobileMenu, setMobileMenu] = useState(false);

  const handleDismissMobileMenu = useCallback(() => {
    setMobileMenu(false);
  }, [setMobileMenu]);

  const handlePresentMobileMenu = useCallback(() => {
    setMobileMenu(true);
  }, [setMobileMenu]);
  return (
    <Providers>
      <Router basename="/solarite">
        <TopBar onPresentMobileMenu={handlePresentMobileMenu} />
        <MobileMenu onDismiss={handleDismissMobileMenu} visible={mobileMenu} />
        <Switch>
          {/* <Route
            exact
            path="/"
            render={() => {
              return <Redirect to="/solarite" />;
            }}
          /> */}
          <Route path="/" exact>
            <Home />
          </Route>
          <Route path="/farms">
            <Farms />
          </Route>
          {/* <Route path="/vote">
            <Vote />
          </Route> */}
          <Route path="/stats">
            <Statics />
          </Route>
        </Switch>
      </Router>
    </Providers>
  );
};

const Providers: React.FC = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <UseWalletProvider chainId={1}>
        <SolariteProvider>
          <TransactionProvider>
            <ModalsProvider>
              <FarmsProvider>
                <ProposalsProvider>{children}</ProposalsProvider>
              </FarmsProvider>
            </ModalsProvider>
          </TransactionProvider>
        </SolariteProvider>
      </UseWalletProvider>
    </ThemeProvider>
  );
};

export default App;
