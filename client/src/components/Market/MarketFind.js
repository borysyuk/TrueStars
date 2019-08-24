import React, {Component} from 'react';
import {NotificationManager} from 'react-notifications';
import {withRouter} from "react-router-dom"
import GeneralService from "../../services/GeneralService";
import { Link } from 'react-router-dom';

class MarketFind extends Component {
    constructor(props) {
        super(props);

        this.state = {
            marketId: props.id,

            marketHash: props.marketHash
        };

        this.handleIdChange = this.handleIdChange.bind(this);
    }

    handleIdChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        var state = {...this.state};
        state['id'] = value;
        state['marketHash'] = '/marketowner/market/view/'+value;

        this.setState(state);
    }

    render() {
        console.log('FORM STATE: ', this.state);
        return (
            <div className="pure-g">
                <div className='pure-u-1-1'>

                    <form className="pure-form pure-form-aligned">
                        <fieldset>
                            <div className="pure-control-group">
                                <label htmlFor="id">Find market by Internal ID <span className="required">*</span></label>
                                <input name="id"
                                       type="text"
                                       placeholder="Internal id"
                                       value={this.state.id}
                                       onChange={this.handleIdChange}

                                />&nbsp;
                                <Link to={this.state.marketHash} className="pure-button">Find market</Link>
                            </div>
                        </fieldset>
                    </form>
                </div>
            </div>
        );
    }
}

export default withRouter(MarketFind);