import React, {Component} from 'react';
import {NotificationManager} from "react-notifications";

class FormComponent extends Component {

    showInvalidData(fields, messages) {
        var invalid = {...this.state.invalid};
        fields.map((field) => {
            invalid[field] = true;
            return invalid[field];
        });
        this.setState({
            invalid: invalid
        });
        messages.map(message => NotificationManager.error(message, '', 8000));
    }

    handleInputChange(entityName) {
        return event => {
            const target = event.target;
            const value = target.type === 'checkbox' ? target.checked : target.value;
            const name = target.name;

            var entity = {...this.state[entityName]};
            entity[name] = value;

            var invalid = {...this.state.invalid};
            invalid[name] = false;
            var newState = {};
            newState[entityName] = entity;
            newState.invalid = invalid;
            this.setState(newState);
        }
    }

}

export default FormComponent;