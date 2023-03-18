import type {
  INpmOutdated,
  IFlatNpmOutdated,
  IUpemOutdated,
  IUpemPolicy,
} from "types/upem.js";

function determineTargetVersion(
  pOutdatedEntry: IFlatNpmOutdated,
  pPolicy: keyof IFlatNpmOutdated
): string {
  return pOutdatedEntry[pPolicy] || pOutdatedEntry.current;
}

function objectToArray(pObject: INpmOutdated): IFlatNpmOutdated[] {
  return Object.keys(pObject).map((pKey: string) => ({
    package: pKey,
    ...pObject[pKey],
  })) as IFlatNpmOutdated[];
}

function tagOutdatedEntry(pPolicies: IUpemPolicy[]) {
  return (pOutdatedEntry: IFlatNpmOutdated): IUpemOutdated => {
    const lPolicy =
      pPolicies.find((pPolicy) => pPolicy.package === pOutdatedEntry.package)
        ?.policy ?? "latest";
    return {
      ...pOutdatedEntry,
      policy: lPolicy,
      target: determineTargetVersion(
        pOutdatedEntry,
        lPolicy as keyof IFlatNpmOutdated
      ),
    };
  };
}

export function isUpAble(pOutdated: IUpemOutdated): boolean {
  return pOutdated.current !== pOutdated.target;
}

export function determinePolicies(
  pOutdatedPackages: INpmOutdated,
  pPolicies: IUpemPolicy[]
): IUpemOutdated[] {
  return objectToArray(pOutdatedPackages).map(tagOutdatedEntry(pPolicies));
}
