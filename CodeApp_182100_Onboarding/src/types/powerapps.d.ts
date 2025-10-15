declare namespace ComponentFramework {
  interface Context<TInputs> {
    parameters: TInputs;
    updateExternalState?(): void;
  }

  interface IInputs extends Record<string, unknown> {}
  interface IOutputs extends Record<string, unknown> {}
}

declare module "powerapps" {
  export = ComponentFramework;
}
