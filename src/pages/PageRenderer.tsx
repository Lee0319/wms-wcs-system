import { Dashboard } from '@/pages/dashboard/Dashboard'
import { InventoryQuery } from '@/pages/dashboard/InventoryQuery'
import { GroupPallet } from '@/pages/dashboard/GroupPallet'
import { InOutRecords } from '@/pages/dashboard/InOutRecords'
import { BaseDataPage } from '@/pages/base/BaseData'
import { Receiving } from '@/pages/inbound/Receiving'
import { InventoryLedger } from '@/pages/inbound/InventoryLedger'
import { BoxPutaway } from '@/pages/inbound/BoxPutaway'
import { AisleMonitor } from '@/pages/warehouse/AisleMonitor'
import { OutboundOrders } from '@/pages/warehouse/OutboundOrders'
import { WavePick } from '@/pages/warehouse/WavePick'
import { PalletCall } from '@/pages/warehouse/PalletCall'
import { TrayAreaMgmt } from '@/pages/warehouse/TrayAreaMgmt'
import { PalletMove } from '@/pages/warehouse/PalletMove'
import { BinMapLayout } from '@/pages/warehouse/BinMapLayout'
import { WcsPages, SystemPages, DesignPages } from '@/pages/Pages'
import { findMenuItem } from '@/config/menu'
import { ComingSoon } from '@/pages/shared/ComingSoon'

export function PageRenderer({ id }: { id: string }) {
  switch (id) {
    case 'p0': return <Dashboard />
    case 'p20': return <InventoryQuery />
    case 'p21': return <GroupPallet />
    case 'p22': return <InOutRecords />
    case 'p1': return <Receiving />
    case 'p2': return <InventoryLedger />
    case 'p30': return <BoxPutaway />
    case 'p3': return <AisleMonitor />
    case 'p4': return <OutboundOrders />
    case 'p5': return <WavePick />
    case 'p6': return <PalletCall />
    case 'p7': return <TrayAreaMgmt />
    case 'p11': return <PalletMove />
    case 'p31': return <BinMapLayout />
    case 'p15': case 'p16': case 'p28': case 'p24': case 'p17':
    case 'p23': case 'p29': case 'p18': case 'p19':
      return <BaseDataPage id={id} />
    case 'p8': case 'p9': case 'p12':
      return <WcsPages id={id} />
    case 'p14': case 'p13': case 'p25': case 'p26':
      return <SystemPages id={id} />
    case 'p27': case 'd2': case 'd5':
      return <DesignPages id={id} />
    default: {
      const item = findMenuItem(id)
      return <ComingSoon title={item?.label || '页面'} description={item ? `${item.id} · ${item.perm}` : undefined} />
    }
  }
}
