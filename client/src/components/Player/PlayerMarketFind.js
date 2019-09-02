import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import FormComponent from "../General/FormComponent";

class MarketFind extends FormComponent {
    constructor(props) {
        super(props);

        this.state = {
            marketHash: props.marketHash
        };

        this.handleInputChange = this.handleInputChange('marketHash');
        this.handleInputChange = this.handleInputChange.bind(this);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.history.push('/player/market/'+this.state.marketHash);
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
                                       // value={this.state.id}
                                       onChange={this.handleIdChange}

                                />&nbsp;
                                <input type="submit" className="pure-button" value="Find market" />
                                {/*<Link to={this.state.marketHash} className="pure-button">Find market</Link>*/}
                            </div>
                        </fieldset>
                    </form>
                </div>
            </div>
        );
    }
}

export default MarketFind;