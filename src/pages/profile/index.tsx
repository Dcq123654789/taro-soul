import { View, Text, Image } from '@tarojs/components'

export default function Profile () {
  return (
    <View
      style={{
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        padding: '16px 16px 0',
        boxSizing: 'border-box'
      }}
    >
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: '16px'
        }}
      >
        <Image
          src='https://via.placeholder.com/72x72.png?text=%F0%9F%A4%97'
          style={{ width: '72px', height: '72px', borderRadius: '36px', marginRight: '12px' }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>
            昵称用户
          </Text>
          <View style={{ marginTop: '4px' }}>
            <Text style={{ fontSize: '12px', color: '#64748B' }}>个性签名：保持热爱</Text>
          </View>
        </View>
        <View
          style={{
            padding: '6px 10px',
            borderRadius: '999px',
            backgroundColor: '#F1F5F9'
          }}
        >
          <Text style={{ fontSize: '12px', color: '#475569' }}>LV 3</Text>
        </View>
      </View>

      <View
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '10px',
          marginBottom: '16px'
        } as any}
      >
        {[
          { label: '关注', value: 68 },
          { label: '粉丝', value: 125 },
          { label: '获赞', value: '1.2k' }
        ].map((s) => (
          <View
            key={s.label}
            style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              padding: '12px',
              textAlign: 'center'
            } as any}
          >
            <Text style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>
              {String(s.value)}
            </Text>
            <View style={{ marginTop: '4px' }}>
              <Text style={{ fontSize: '12px', color: '#64748B' }}>{s.label}</Text>
            </View>
          </View>
        ))}
      </View>

      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 1px 10px rgba(15,23,42,0.06)'
        }}
      >
        {[
          { title: '我的订单', desc: '查看全部订单' },
          { title: '地址管理', desc: '收货地址与联系信息' },
          { title: '账户设置', desc: '资料、隐私与安全' }
        ].map((item, idx, arr) => (
          <View
            key={item.title}
            style={{
              padding: '14px 12px',
              borderBottom: idx === arr.length - 1 ? '0 none' : '1px solid #F1F5F9',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <View
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#EEF2FF',
                marginRight: '10px'
              }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>
                {item.title}
              </Text>
              <View style={{ marginTop: '2px' }}>
                <Text style={{ fontSize: '12px', color: '#94A3B8' }}>{item.desc}</Text>
              </View>
            </View>
            <Text style={{ color: '#CBD5E1' }}>{'>'}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

