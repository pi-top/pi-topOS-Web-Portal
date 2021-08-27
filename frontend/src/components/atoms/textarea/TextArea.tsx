import React, { ReactNode } from 'react';
// import cx from 'classnames';

// import styles from './TextArea.module.css';

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

// export default ({ children, className, onChange, disabled, value, ...props }: Props) => (
//   <div className={cx(styles.root, className)}>
//     <textarea
//       disabled={disabled}
//       className={cx(styles.textarea, className)}
//       onChange={onChange}
//       value={value}
//       {...props}
//     />
//   </div>
// );

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
        return <textarea {...this.props} ref={e => this.element = e} />
    }

}
