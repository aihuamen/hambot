import { Injectable } from '@nestjs/common';

import { Cron } from '@nestjs/schedule';
import { AppLogger } from '../logger/logger';
import { TrelloService } from '../trello/trello.service';
import path from 'path';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';

@Injectable()
export class FileSchedule {
  constructor(private logger: AppLogger, private trello: TrelloService) {
    this.logger.setContext('FileSchedule');
  }

  @Cron('0 0 * * * *')
  async cleanFiles() {
    this.logger.debug('Cleaning files');
    const board = (await this.trello.getBoards()).find(
      b => b.name === 'HamBot',
    );
    const list = (await this.trello.getLists(board.id)).find(
      l => l.name === 'files',
    );
    const cards = await this.trello.getCards(list.id);
    await Promise.all(cards.map(c => this.trello.deleteCard(c.id)));
    const tmpPath = path.join(__dirname, '../file/tmp');
    await mkdirp(tmpPath);
    await new Promise(resolve => rimraf(tmpPath, resolve));
    this.logger.debug(`Removed ${cards.length} files`);
  }
}
