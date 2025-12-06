import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class LogisticsService {
  private readonly logger = new Logger(LogisticsService.name);
  private readonly appCode: string;
  private readonly apiUrl = 'https://cexpress.market.alicloudapi.com/cexpress';

  constructor(private configService: ConfigService) {
    this.appCode = this.configService.get<string>('ALIYUN_LOGISTICS_APPCODE');
    
    if (!this.appCode) {
      this.logger.warn('Aliyun Logistics APPCODE not configured');
    }
  }

  /**
   * 查询物流轨迹信息
   * @param trackingNumber 物流单号
   * @returns 物流轨迹数据
   */
  async queryTracking(trackingNumber: string) {
    if (!this.appCode) {
      throw new Error('Logistics service not configured');
    }

    try {
      this.logger.log(`Querying logistics for tracking number: ${trackingNumber}`);

      const response = await axios.get(this.apiUrl, {
        params: {
          no: trackingNumber,
        },
        headers: {
          'Authorization': `APPCODE ${this.appCode}`,
        },
        timeout: 10000,
      });

      if (response.data && response.data.code === 'OK') {
        this.logger.log(`Successfully retrieved logistics data for: ${trackingNumber}`);
        // Map the response to our standard format
        // Response structure:
        // {
        //   "code": "OK",
        //   "no": "...",
        //   "type": "YD",
        //   "list": [ { "content": "...", "time": "..." } ],
        //   "state": "3",
        //   "msg": "查询成功",
        //   "name": "韵达快递",
        //   ...
        // }
        return {
          success: true,
          data: {
            trackingNumber: trackingNumber,
            company: response.data.name || '未知快递公司',
            companyCode: response.data.type || '',
            status: response.data.state || '0',
            statusText: this.getStatusText(response.data.state),
            updateTime: response.data.updateTime || '',
            list: (response.data.list || []).map(item => ({
              time: item.time,
              status: item.content,
            })),
          },
        };
      } else {
        this.logger.error(`Failed to query logistics: ${response.data?.msg || 'Unknown error'}`);
        return {
          success: false,
          message: response.data?.msg || '查询物流信息失败',
        };
      }
    } catch (error) {
      this.logger.error(`Error querying logistics: ${error.message}`, error.stack);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          return {
            success: false,
            message: '物流服务认证失败，请检查 AppCode 配置',
          };
        }
        if (error.response?.status === 404) {
           return {
            success: false,
            message: '物流服务接口地址错误',
          };
        }
      }

      return {
        success: false,
        message: '查询物流信息失败，请稍后重试',
      };
    }
  }

  /**
   * 将物流状态码转换为中文描述
   */
  private getStatusText(status: string): string {
    // 状态码映射可能因服务商而异，这里基于常见标准
    // 0:在途，1:揽收，2:疑难，3:签收，4:退签，5:派件，6:退回
    // 之前的映射: '0': '暂无轨迹', '1': '快递收件', '2': '在途中', '3': '签收', '4': '问题件'
    // 该服务商似乎使用: "state": "3" (签收)
    const statusMap = {
      '0': '在途中',
      '1': '已揽收',
      '2': '疑难件',
      '3': '已签收',
      '4': '退签',
      '5': '派送中',
      '6': '退回',
    };
    return statusMap[status] || '运输中';
  }
}
