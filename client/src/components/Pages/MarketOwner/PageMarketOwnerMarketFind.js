import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import { Link } from 'react-router-dom';
import MarketFind from "../../Market/MarketFind";


class PageMarketOwnerChange extends Component {


    render() {
        return (
            <div className="pure-g generalPage">
                <div className='pure-u-1-1'>
                    <MarketFind marketId="" marketHash="" />
                </div>

            </div>
        )
    }
}

export default withRouter(PageMarketOwnerChange);