import { AaveSafetyModule } from '@bgd-labs/aave-address-book';
import { SignatureLike } from '@ethersproject/bytes';

export class StkAbptMigrationService {
  private async getService() {
    const StkABPTMigrationService = (await import('@aave/contract-helpers')).StkABPTMigratorService;
    return new StkABPTMigrationService(AaveSafetyModule.STK_ABPT_STK_AAVE_WSTETH_BPTV2_MIGRATOR);
  }

  async migrate(user: string, amount: string, outAmountMin: string) {
    const service = await this.getService();
    return service.migrate(user, amount, ['0', '0'], outAmountMin);
  }

  async migrateWithPermit(
    user: string,
    amount: string,
    outAmountMin: string,
    signature: SignatureLike,
    deadline: string
  ) {
    const service = await this.getService();
    return service.migrateWithPermit({
      user,
      amount,
      tokenOutAmountsMin: ['0', '0'],
      poolOutAmountMin: outAmountMin,
      signature,
      deadline,
    });
  }
}
