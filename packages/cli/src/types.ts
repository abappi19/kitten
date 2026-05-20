export type CommLang = 'English' | 'Bangla';
export type Branch = 'main' | 'dev' | 'beta';
export type Scope = 'local' | 'global';

export interface InstallConfig {
    userName: string;
    commLang: CommLang;
    token: string;
    branch: Branch;
}

export interface InstallContext {
    config: InstallConfig;
    bundleDir: string;
    skillDir: string;
    draftDir: string;
    scope: Scope;
}

export interface Step {
    label: string;
    run(ctx: InstallContext): void | Promise<void>;
}
