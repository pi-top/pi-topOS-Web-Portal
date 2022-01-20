export type Network = {
  ssid: string;
  passwordRequired: boolean
  bssid: string;
};

export type NetworkCredentials = {
  bssid: string;
  password: string;
};
