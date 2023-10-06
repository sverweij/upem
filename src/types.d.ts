export type DependenciesTypeType =
  | "dependencies"
  | "devDependencies"
  | "peerDependencies"
  | "optionalDependencies"
  | "bundledDependencies"
  | "bundleDependencies";

export type PolicyType =
  /**
   * default policy: upgrade to latest
   */
  | "latest"
  /**
   * upgrade to the version indicated in the version range
   */
  | "wanted"
  /**
   * keep the current version
   * @deprecated
   */
  | "pin"
  /**
   * same as 'pin'
   */
  | "current";

export interface INpmOutdatedRecord {
  current: string;
  wanted: string;
  latest: string;
  location: string;
  dependent?: string;
  type?: DependenciesTypeType;
  homepage?: string;
}

export interface INpmOutdated {
  [packageName: string]: INpmOutdatedRecord;
}

export interface IFlatNpmOutdated extends INpmOutdatedRecord {
  /**
   * the name of the package the policy applies to
   */
  package: string;
}

export interface IUpemOutdated extends IFlatNpmOutdated {
  /**
   * what policy to apply to the package
   */
  policy: PolicyType;
  /**
   * new version when upem is done upgrading
   */
  target: string;
}

export interface IUpemPolicy {
  /**
   * the name of the package the policy applies to
   */
  package: string;
  /**
   * the policy to apply. The default when no upem.policy is defined
   * is "latest"
   */
  policy: PolicyType;
  /**
   * explanation of why this policy is in place
   */
  because?: string;
}

export interface IManifest {
  upem?: {
    policies: IUpemPolicy[];
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [whateverOtherKey: string]: any;
}

export type PrefixType = "^" | "" | "~";

export interface IUpemOptions {
  /**
   * how updated packages get prefixed if true:'', if false or left out
   * (the default) it'll use savePrefix
   */
  saveExact?: boolean;
  /**
   * prefix to save new or updated package versions under
   */
  savePrefix?: PrefixType;
  /**
   * Dependencies to not apply upgrades to. This could e.g. make
   * sense for peerDependencies, that usually have large ranges in any case
   */
  skipDependencyTypes?: DependenciesTypeType[];
  /**
   * if true upem will not update the manifest, but just output what it would've done
   * in all other cases will also update the manifest
   */
  dryRun?: boolean;
}

export interface IUpemReturn {
  /**
   * false when upem encountered a hitch during execution, true
   * in all other cases
   */
  OK: boolean;
  /**
   * human readable message
   */
  message: string;
  outdatedList?: IUpemOutdated[];
}
