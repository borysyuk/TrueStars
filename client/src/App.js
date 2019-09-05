import React, { Component } from "react";
import {Switch, Route, BrowserRouter as Router} from 'react-router-dom'
import MainContract from "./contracts/TrueStars.json";
import getWeb3 from "./utils/getWeb3";

import './css/oswald.css';
import './css/open-sans.css';
import './css/pure-min.css';
import "./App.css";
import 'react-notifications/lib/notifications.css';
import 'antd/dist/antd.css';


import AppStorageService from "./services/AppStorageService";
import GeneralService from "./services/GeneralService";
import {NotificationContainer} from 'react-notifications';
import PageMarketOwnerIndex from "./components/Pages/MarketOwner/PageMarketOwnerIndex";
import PageGeneralIndex from "./components/Pages/General/PageGeneralIndex";
import PagePlayerIndex from "./components/Pages/Player/PagePlayerIndex";
import PageEmpty from "./components/Pages/PageEmpty";
import { Link } from 'react-router-dom';

class App extends Component {
    state = {
        web3: null,
        account: null,
        contract: null,
        isReady: false,
        isError: false,
        errorMessage: ''
    };

    displayErrors(errorMessage) {
        this.setState({
            isError: true,
            isReady: true,
            errorMessage: errorMessage
        });
    }

    initWeb3() {
        return getWeb3().then(web3 => {
            AppStorageService.set('web3', web3);
            return web3;
        }).catch(() => {
            this.displayErrors('Error finding web3.');
        })
    }

    InspectAccountChange() {
        this.changeAccountIntervalId = setInterval(() => {
            GeneralService.getCurrentAccount().then((newAccount) => {
                if ((newAccount !== this.state.account) && (this.state.account)) {
                    window.location.reload();
                }
            });
        }, 1000);
    }

    initApplication() {
        return this.initWeb3().then(web3 => {
            console.log("2web3", web3);
            return web3.eth.net.getId().then(networkId => {
                const deployedNetwork = MainContract.networks[networkId];
                if (deployedNetwork === undefined) {
                    return Promise.reject("Ca't find the contract in this network");
                }
                const instance = new web3.eth.Contract(
                    MainContract.abi,
                    deployedNetwork && deployedNetwork.address,
                );

                GeneralService.getCurrentAccount().then(account => {
                    AppStorageService.set('mainContract', instance);
                    AppStorageService.set('currentAccount', account);

                    console.log('App DATA', AppStorageService);
                    this.setState({isReady: true, web3: web3, account: account, contract: instance });
                });
            });

        }).catch(e => {
            console.log('NO Web3. User mode on.', e);
            this.setState({isReady: true, web3: null, account: null, contract: null});
        });
    }

    componentWillUnmount() {
        clearInterval(this.changeAccountIntervalId);
    }


    componentDidMount() {
        this.initApplication().then(() => {
            this.InspectAccountChange();
        }).catch(error => {
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        });
    };

    render() {
        if (!this.state.isReady) {
            return <div>Loading...</div>;
        } else {
            if (!this.state.web3) {
                return <div>Can't load web3 or contract</div>;
            } else {
                return (
                    <div className="general-container">
                        Hello {this.state.account} !

                        <div className="App">
                            <Router>
                                <main className="container">
                                    <div className='sub-container'>

                                        <div className="pure-g">
                                            <div className='pure-u-1-1'>
                                                <center><h1>True Stars</h1> market page</center>
                                                <div>
                                                    <Link to="/marketowner" className="pure-button">Market owner section</Link>&nbsp;
                                                    <Link to="/player" className="pure-button">Player section</Link>
                                                </div>
                                            </div>
                                        </div>
                                        <Switch>
                                            <Route path='/' exact render={(props) => (
                                                <PageGeneralIndex />
                                            )}/>

                                            <Route path='/marketowner' component={PageMarketOwnerIndex}/>
                                            <Route path='/player' component={PagePlayerIndex}/>
                                            <Route render={(props) => (
                                                <PageEmpty text="Error: 404. Page not found."/>
                                            )}/>


                                        </Switch>
                                    </div>
                                </main>
                            </Router>
                            <NotificationContainer/>
                        </div>
                    </div>
                );
            }

        }
    }
}

export default App;
