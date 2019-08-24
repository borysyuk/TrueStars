import React, {Component} from 'react';

class Loading extends Component {

    render() {
        return (
            <div>
                {this.props.loading &&
                <div className="lds-default">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                }
            </div>
        );
    }
}

export default Loading;