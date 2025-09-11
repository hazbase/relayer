export interface ForwardRequest {
    from:  string;
    to:    string;
    value: string;
    gas:   number;
    nonce: number;
    data:  string;
}
  
export interface Domain {
    name:              string;
    version:           string;
    chainId:           number;
    verifyingContract: string;
}
  