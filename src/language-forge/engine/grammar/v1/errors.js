export class GrammarError extends Error {
  constructor(code,details={}) {super(code);this.name='GrammarError';this.code=code;this.details=details;}
}
