const store = new Map();
const logins = new Map();

class Account {
  constructor(id, profile, orgId) {
    // make accontId globally unique
    this.accountId = `${orgId}:${id}`;
    this.profile = profile;
    this.orgId = orgId;
    store.set(this.accountId, this);
  }

  /**
   * @param use - can either be "id_token" or "userinfo", depending on
   *   where the specific claims are intended to be put in.
   * @param scope - the intended scope, while oidc-provider will mask
   *   claims depending on the scope automatically you might want to skip
   *   loading some claims from external resources etc. based on this detail
   *   or not return them in id tokens but only userinfo and so on.
   */

  // eslint-disable-next-line no-unused-vars
  async claims(use, scope) {
    // `profile` corresponds to a passport-openidconnect strategy object.
    // see https://github.com/jaredhanson/passport-openidconnect/blob/master/lib/profile.js
    if (this.profile) {
      return {
        sub: this.accountId, // it is essential to always return a sub claim
        name: this.profile.displayName,
        preferred_username: this.profile.username,
        email:
          this.profile.emails && this.profile.emails.length > 0
            ? this.profile.emails[0].value
            : undefined,

        // passport-openidconnect does not parse out email_verified.  Will need to do something special if we care about email_verified
        // email_verified: this.profile.email_verified,

        family_name: this.profile.name ? this.profile.name.familyName : undefined,
        given_name: this.profile.name ? this.profile.name.givenName : undefined,
        locale: this.profile.locale,
        app_org: this.orgId,
      };
    }

    return {
      sub: this.accountId, // it is essential to always return a sub claim
    };
  }

  static async findByFederated(provider, claims) {
    const id = `${provider}.${claims.sub}`;
    if (!logins.get(id)) {
      logins.set(id, new Account(id, claims));
    }
    return logins.get(id);
  }

  static async findByLogin(login) {
    if (!logins.get(login)) {
      logins.set(login, new Account(login));
    }

    return logins.get(login);
  }

  static async upsertAccount(id, profile, orgId) {
    // constructing an account adds it to the store...yuck
    return new Account(id, profile, orgId);
  }

  // eslint-next-disable-line no-unused-vars
  static async findAccount(ctx, id, token) {
    // token is a reference to the token used for which a given account is being loaded,
    //   it is undefined in scenarios where account claims are returned from authorization endpoint
    // ctx is the koa request context
    if (!store.get(id)) new Account(id); // eslint-disable-line no-new
    return store.get(id);
  }

  static getOrgId(id) {
    if (!id) {
      return null;
    }

    return id.split(':')[0];
  }
}

export default Account;
