import React, {Component} from 'react';
import {Switch, Route} from 'react-router-dom'
import {withRouter} from 'react-router-dom';
import PageMarketOwnerMarketNew from "./PageMarketOwnerMarketNew";
import PageMarketOwnerMarketChange from "./PageMarketOwnerMarketChange";
import { Link } from 'react-router-dom';


class PageMarketOwnerIndex extends Component {

    render() {
        return (
            <div className="pure-g generalPage">
                <div className='pure-u-1-1'>
                    <center><h1>True Stars</h1> market page</center>
                    <div>
                        <Link to='/marketowner/market/new' className="pure-button">Create new market</Link>&nbsp;
                        <Link to='/marketowner/market/change' className="pure-button">Change market</Link>&nbsp;
                    </div>
                </div>

                <Switch>
                    <Route path='/marketowner/market/new' exact component={PageMarketOwnerMarketNew}/>
                    <Route path='/marketowner/market/change' exact component={PageMarketOwnerMarketChange}/>
                </Switch>

            </div>
        )
    }
}

export default withRouter(PageMarketOwnerIndex);