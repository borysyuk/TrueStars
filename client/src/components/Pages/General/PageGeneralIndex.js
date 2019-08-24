import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import { Link } from 'react-router-dom';


class PageGeneralIndex extends Component {

    render() {
        return (
            <div className="pure-g generalPage">
                <div className='pure-u-1-1'>
                    <center><h1>True Stars</h1> index page</center>
                    <div>
                        <Link to="/marketowner" className="pure-button">Market owner section</Link>&nbsp;
                        <Link to="/player" className="pure-button">Player section</Link>
                    </div>

                </div>
            </div>
        )
    }
}

export default withRouter(PageGeneralIndex);