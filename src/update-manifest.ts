import type {
  DependenciesTypeType,
  IManifest,
  IUpemOptions,
  IUpemOutdated,
} from "./types.js";

function isUpAbleDependencyKey(pSkipDependencyTypes: DependenciesTypeType[]) {
  return (pManifestKey: string): boolean =>
    pManifestKey.includes("ependencies") &&
    !pSkipDependencyTypes.includes(pManifestKey as DependenciesTypeType);
}

function getRangePrefix(pVersionRangeString: string): string {
  return (
    /* c8 ignore start */
    /* c8 ignore - as the ?? "" safety valve is never hit */
    /^(?<prefix>\D{0,2}).+/.exec(pVersionRangeString)?.groups?.prefix ?? ""
    /* c8 ignore stop */
  );
}

export function determineSavePrefix(
  pVersionRangeString: string,
  pOptions?: IUpemOptions,
): string {
  const lIndividualRangePrefix = getRangePrefix(pVersionRangeString);

  if (pOptions?.saveExact && lIndividualRangePrefix) {
    return lIndividualRangePrefix;
  }

  return pOptions?.saveExact ? "" : (pOptions?.savePrefix ?? "^");
}

export function updateDependencyKey(
  pDependencyObject: { [packageName: string]: string },
  pOutdatedList: IUpemOutdated[],
  pOptions: IUpemOptions,
) {
  return {
    ...pDependencyObject,
    ...Object.keys(pDependencyObject)
      .filter((pDependency) =>
        pOutdatedList.some(
          (pOutdatedEntry) => pOutdatedEntry.package === pDependency,
        ),
      )
      .reduce((pAll, pPackageName) => {
        pAll[pPackageName] = `${determineSavePrefix(
          pDependencyObject[pPackageName] as string,
          pOptions,
        )}${
          pOutdatedList.find(
            (pOutdatedEntry) => pOutdatedEntry.package === pPackageName,
          )?.target
        }`;
        return pAll;
      }, {} as IManifest),
  };
}

export function updateManifest(
  pManifestObject: IManifest,
  pOutdatedPackages: IUpemOutdated[],
  pOptions: IUpemOptions,
): IManifest {
  return {
    ...pManifestObject,
    ...Object.keys(pManifestObject)
      .filter(isUpAbleDependencyKey(pOptions?.skipDependencyTypes ?? []))
      .reduce((pAll: IManifest, pDependencyKey: keyof IManifest) => {
        pAll[pDependencyKey] = updateDependencyKey(
          pManifestObject[pDependencyKey],
          pOutdatedPackages,
          pOptions,
        );
        return pAll;
      }, {}),
  };
}
