import React, {Component} from 'react';
import {Switch, Route} from 'react-router-dom'
import {withRouter} from 'react-router-dom';
import PageMarketOwnerMarketNew from "./PageMarketOwnerMarketNew";
import PageMarketOwnerMarketFind from "./PageMarketOwnerMarketFind";
import { Link } from 'react-router-dom';
import PageMarketOwnerMarketView from "./PageMarketOwnerMarketView";


class PageMarketOwnerIndex extends Component {

    render() {
        return (
            <div>
                <div style={{margin: "10px"}}>
                    <Link to='/marketowner/market/new' className="pure-button">Create new market</Link>&nbsp;
                    <Link to='/marketowner/market/change' className="pure-button">Find market</Link>&nbsp;
                </div>

                <Switch>
                    <Route path='/marketowner/market/new' exact component={PageMarketOwnerMarketNew}/>
                    <Route path='/marketowner/market/change' exact component={PageMarketOwnerMarketFind}/>
                    <Route path='/marketowner/market/view/:id' exact component={PageMarketOwnerMarketView}/>
                </Switch>
            </div>
        )
    }
}

export default withRouter(PageMarketOwnerIndex);