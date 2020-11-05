module.exports = function (shipit) {
  // Load shipit-deploy tasks
  require("shipit-deploy")(shipit);

  shipit.initConfig({
    default: {
      user: "bitnami",
      deployTo: "",
      ignores: [".git", "node_modules", "deploy"]
    },
    staging: {
      // ssh bitnami@x.x.x.x -i doc/aws/xxx-staging.pem
      servers: ["ec2-user@x.x.x.x"],
      deployTo: "",
      key: "doc/aws/xxx-api-staging.pem"
    },
    production: {
      servers: ["ec2-user@x.x.x.x"],
      key: "doc/aws/xxxx-api-production.pem"
    },
  });

  shipit.task("html-boilerplate:deploy", async () => {
    await shipit.local("node-sass stylesheets/main.scss css/main.css");
    // Zip the dist folder into dist.zip package then remove the folder as we don't need it anymore
    await shipit.local("zip -r dist.zip *");

    // Create deployTo folder if it's not existed
    await shipit.remote(
      `sudo mkdir -p ${shipit.config.deployTo} && sudo chown -R bitnami: ${shipit.config.deployTo}`
    );

    // // remove old frontend files
    await shipit.remote(`rm -rf ${shipit.config.deployTo}/*`);

    // // Copy dist.zip to servers
    await shipit.copyToRemote("dist.zip", shipit.config.deployTo);

    // // Remove the dist.zip
    await shipit.local("rm dist.zip");

    // // On server, unzip the dist.zip file then remove the zip package
    await shipit.remote(
      `cd ${shipit.config.deployTo} && unzip -o dist.zip && rm dist.zip`
    );
  });
};
