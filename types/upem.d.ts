export interface INpmOutdatedData {
  current: string;
  wanted: string;
  latest: string;
  location: string;
}

export interface INpmOutdated {
  [packageName: string]: INpmOutdatedData;
}

export interface IMinimalManifest {
  upem?: {
    policies: IUpemPolicy[];
  };
}

export type IManifest = IMinimalManifest;

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

export interface IUpemOutdated extends INpmOutdatedData {
  /**
   * the name of the package the policy applies to
   */
  package: string;
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

type PrefixType = "^" | "" | "~";
type DependenciesTypeType =
  | "dependencies"
  | "devDependencies"
  | "peerDependencies"
  | "optionalDependencies"
  | "bundledDependencies"
  | "bundleDependencies";
export interface IUpemOptions {
  /**
   * how updated packages get prefixed if true:'', if false or left out
   * (the default) it'll use savePrefix
   */
  saveExact: boolean;
  /**
   * prefix to save new or updated package versions under
   */
  savePrefix: PrefixType;
  /**
   * Dependencies to not apply upgrades to. This could e.g. make
   * sense for peerDependencies, that usually have large ranges in any case
   */
  skipDependencyTypes?: DependenciesTypeType[];
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
  outdatedList: IUpemOutdated[];
}
