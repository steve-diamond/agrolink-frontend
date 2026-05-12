declare module 'africastalking' {
  interface SMSService {
    send(options: {
      to: string | string[];
      message: string;
      from?: string;
    }): Promise<unknown>;
  }

  interface AfricasTalkingInstance {
    SMS: SMSService;
  }

  function AfricasTalking(options: { username: string; apiKey: string }): AfricasTalkingInstance;
  export = AfricasTalking;
}
