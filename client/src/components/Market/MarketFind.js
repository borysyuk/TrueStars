import React from 'react';
import {withRouter} from "react-router-dom"
import FormComponent from "../General/FormComponent";

class MarketFind extends FormComponent {
    constructor(props) {
        super(props);

        console.log("PROPS!!!!", props);
        this.state = {
            form: {
                marketId: props.id,
            },
            invalid: {
                marketId: false,
            }

        };

        this.handleInputChange = this.handleInputChange('form');
        this.handleInputChange = this.handleInputChange.bind(this);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();
        console.log(this.props);
        this.props.history.push('/marketowner/market/view/'+this.state.form.marketId);
        return false;
    }

    render() {
        console.log('FORM STATE: ', this.state);
        return (
            <div className="pure-g">
                <div className='pure-u-1-1'>

                    <form className="pure-form pure-form-aligned" onSubmit={this.handleSubmit}>
                        <fieldset>
                            <div className="pure-control-group">
                                <label htmlFor="marketId">Find market by Internal ID <span className="required">*</span></label>
                                <input name="marketId"
                                       type="text"
                                       placeholder="Internal id"
                                       onChange={this.handleInputChange}
                                       value={this.state.form.marketId}

                                />&nbsp;
                                <input type="submit" className="pure-button" value="Find market" />
                            </div>
                        </fieldset>
                    </form>
                </div>
            </div>
        );
    }
}

export default withRouter(MarketFind);