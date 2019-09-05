import React from 'react';
import FormComponent from "../General/FormComponent";
import {withRouter} from "react-router-dom"

class PlayerMarketFind extends FormComponent {
    constructor(props) {
        super(props);

        this.state = {
            form: {
                marketHash: props.marketHash
            }
        };

        this.handleInputChange = this.handleInputChange('form');
        this.handleInputChange = this.handleInputChange.bind(this);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.history.push('/player/market/'+this.state.form.marketHash);
    }

    render() {
        console.log('FORM STATE: ', this.state);
        return (
            <div className="pure-g">
                <div className='pure-u-1-1' style={{padding: "10px"}}>

                    <form className="pure-form pure-form-aligned" onSubmit={this.handleSubmit}>
                        <fieldset>
                            <div className="pure-control-group">
                                <label htmlFor="marketHash">Find market by hash <span className="required">*</span></label>
                                <input name="marketHash"
                                       type="text"
                                       placeholder="Market hash"
                                       value={this.state.form.marketHash}
                                       onChange={this.handleInputChange}

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

export default withRouter(PlayerMarketFind);