import Loader from "react-loader-spinner";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

export type Props = {
  size?: number;
};

export default ({ size, ...props }: Props) => (
  <Loader height={size} width={size} type="TailSpin" color="#00ad9f" {...props} />
);
