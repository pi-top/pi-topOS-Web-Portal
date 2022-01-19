export type Network = {
  ssid: string;
  passwordRequired: boolean
  frequency: string;
  bssid: string;
};

export type NetworkCredentials = {
  bssid: string;
  password: string;
};
