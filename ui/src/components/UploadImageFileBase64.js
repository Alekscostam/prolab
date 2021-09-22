import React from 'react';
import PropTypes from "prop-types";
import DivContainer from "./DivContainer";

export default class UploadImageFileBase64 extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            files: [],
        };
    }

    handleChange(e) {
        // get the files
        let files = e.target.files;

        if (files.length > 0) {
            // Process each file
            var allFiles = [];
            for (var i = 0; i < files.length; i++) {

                let file = files[i];

                // Make new FileReader
                let reader = new FileReader();

                // Convert the file to base64 text
                reader.readAsDataURL(file);

                // on reader load somthing...
                reader.onload = () => {

                    // Make a fileInfo Object
                    let fileInfo = {
                        name: file.name,
                        fieldName: this.props.name,
                        type: file.type,
                        size: Math.round(file.size / 1000) + ' kB',
                        base64: reader.result,
                        file: file,
                    };

                    // Push it to the state
                    allFiles.push(fileInfo);

                    // If all files have been proceed
                    if (allFiles.length == files.length) {
                        // Apply Callback function
                        if (this.props.multiple) {
                            this.props.onDone(allFiles);
                        } else {
                            let event = allFiles[0];
                            this.props.onDone(event);
                        }
                    }

                } // reader.onload

            } // for
        } else {
            let fileInfo = {
                fieldName: this.props.name,
            };
            this.props.onDone([fileInfo]);
        }
    }

    render() {
        return (
            <React.Fragment>
                {this.props.rendered ?
                    <DivContainer colClass="row">
                        <DivContainer>
                            <input
                                id={this.props.id}
                                class={`file-chooser ${this.props.className}`}
                                type="file"
                                accept="image/*"
                                onChange={this.handleChange.bind(this)}
                                multiple={this.props.multiple}
                                required={this.state.required}
                            />
                        </DivContainer>
                    </DivContainer>
                    : null}
            </React.Fragment>
        );
    }
}

UploadImageFileBase64.defaultProps = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    className: PropTypes.string,
    required: PropTypes.bool,
    rendered: PropTypes.bool,
    multiple: false,
};

