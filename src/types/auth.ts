// Flutter TPBridge 相關類型
export interface TPBridgeUserInfo {
  id: string;
  account: string;
  username: string;
  realName: string;
  idNo: string;
  email: string;
  phoneNo: string;
  birthday: string;
  memberType: string;
  verifyLevel: string;
  addresses: Array<{
    zip3: number;
    city: string;
    town: string;
    village: string;
    street: string;
    usageType: string;
    seq: number;
    priority: boolean;
  }>;
  residentAddress: string;
  citizen: boolean;
  nativePeople: boolean;
  cityInternetUid: string;
}

export interface TPBridgeMessage {
  name: string;
  data: TPBridgeUserInfo;
}

export interface TPBridge {
  onmessage: (event: MessageEvent) => void;
  postMessage: (action: string, data: unknown) => void;
}

declare global {
  interface Window {
    flutterObject?: TPBridge;
  }
}

// Auth Context 相關類型
export interface AuthContextType {
  userId: string | null;
  token: string | null;
  login: () => Promise<void>;
  logout: () => void;
}
