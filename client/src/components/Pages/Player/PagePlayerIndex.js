import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';


class PagePlayerIndex extends Component {

    render() {
        return (
            <div className="pure-g generalPage">
                <div className='pure-u-1-1'>
                    <center><h1>True Stars</h1> player page</center>
                </div>
            </div>
        )
    }
}

export default withRouter(PagePlayerIndex);