import React, {Component} from 'react';
import {Switch, Route} from 'react-router-dom'
import {withRouter} from 'react-router-dom';
import PlayerMarketFind from "../../Player/PlayerMarketFind"
import PagePlayerMarketView from "./PagePlayerMarketView";


class PagePlayerIndex extends Component {

    render() {
        return (
            <div className="pure-g generalPage">
                <div className='pure-u-1-1'>
                    <PlayerMarketFind />

                    <Switch>
                        <Route path='/player/market/:hash' exact component={PagePlayerMarketView}/>
                    </Switch>

                </div>
            </div>
        )
    }
}

export default withRouter(PagePlayerIndex);