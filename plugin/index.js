/** *** plugin: subdomains ***
 * This plugin adds
 * [properties] subdomains & subdomain on request object
 * import plugin and regester with server
 *    file: server.js
 *    ====================================================
 *    import subdomains from "subdomains";
 *    server.register({
 *      plugin: subdomains,
 *      options: {
 *        domainName: 'domain.com'
 *        exclude: ['www', 'api', 'v2']
 *      }
 *    })
 */

const subdomains = {
  name: "subdomains",
  version: require("../package.json")["version"],
  register: function register(server, options) {
    server.ext("onRequest", (request, h) => {
      // throw Error in case @options[exclude] is not provided
      // while registering the plugin
      if (!Array.isArray(options.exclude))
        throw new TypeError(
          "provide exclude property as an array to" +
            " reject subdomains or provide an empty array!"
        );

      // if url = http://comany.lvh.me:8080/?name=hapi
      // then hostname = company.lvh.me
      const { hostname } = request.info;

      // if hostname = company.api.lvh.me
      //             or company.v2.domain.com
      // then hostNameArray = ['comany', 'api', 'lvh', 'me']
      //                    or ['comapny', 'v2', 'domain', 'com']
      let hostNameArray = hostname.split(".");

      // provide @options[domainName] to reject domain in case of a.co.in
      // otherwise it will
      // reject lvh.me or domain.com or domain.co.in
      const sliceLength = options.domainName
        ? options.domainName.split(".").length
        : 2;
      hostNameArray = hostNameArray.slice(
        0,
        hostNameArray.length - sliceLength
      );

      /**
       * @param{s} subdomain
       */
      hostNameArray = hostNameArray.filter(s => !options.exclude.includes(s));

      // assign subdomains in case one or more present
      // hostname = users.company.lvh.me
      // hostNameArray = ['users', 'company']
      // request.subdomains = ['users', 'company']
      request.subdomains = hostNameArray;

      // assign [0th element] means first subdomain
      // hostname = users.company.lvh.me
      // hostNameArray = ['users', 'company']
      // request.subdomain = 'users'
      [request.subdomain] = hostNameArray;
      return h.continue;
    });
  }
};

module.exports = subdomains;
