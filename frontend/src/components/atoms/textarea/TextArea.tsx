import React, { ReactNode } from 'react';


export type Props = {
    children?: ReactNode;
    className: string,
    onChange?: () => null,
    value: string,
    disabled?: boolean;
    autoScroll?: boolean;
    defaultValue?: string;
};

export type State = {
    value: string;
};


export default class TextArea extends React.Component<Props, State> {
    element: HTMLTextAreaElement | null
    state: State

    constructor(props: Props) {
        super(props);
        this.state = {
            value: this.props.defaultValue || ""
        };
        this.element = null;
    }

    componentDidMount() {
        if (this.element && this.props.autoScroll !== false) {
            this.element.scrollTop = this.element.scrollHeight
        }
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.value !== this.props.value && this.element && this.props.autoScroll !== false) {
            this.element.scrollTop = this.element.scrollHeight
        }
    }

    render() {
        return <textarea
            className={this.props.className}
            onChange={this.props.onChange}
            value={this.props.value}
            disabled={this.props.disabled}
            defaultValue={this.props.defaultValue}
            ref={e => this.element = e} />
    }
}
