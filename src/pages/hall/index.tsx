import { View, Text, Image } from '@tarojs/components'

export default function Hall () {
  return (
    <View
      style={{
        minHeight: '100vh',
        backgroundColor: '#FAFAFB',
        padding: '16px 16px 0',
        boxSizing: 'border-box'
      }}
    >
      <View style={{ marginBottom: '12px' }}>
        <Text style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A' }}>
          社区大厅
        </Text>
        <View style={{ marginTop: '6px' }}>
          <Text style={{ fontSize: '12px', color: '#64748B' }}>
            精彩内容与公告一览
          </Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '14px',
          boxShadow: '0 1px 8px rgba(15, 23, 42, 0.05)',
          marginBottom: '16px'
        }}
      >
        <Text style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A' }}>
          公告
        </Text>
        <View style={{ marginTop: '8px' }}>
          {['版本更新上线', '社区活动征集', '内容规范提醒'].map((t) => (
            <View
              key={t}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid #F1F5F9'
              }}
            >
              <View
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#3B82F6',
                  marginRight: '10px'
                }}
              />
              <Text style={{ fontSize: '14px', color: '#0F172A' }}>{t}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ marginBottom: '12px' }}>
        <Text style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A' }}>
          热门讨论
        </Text>
      </View>
      <View>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '14px',
              boxShadow: '0 1px 8px rgba(15, 23, 42, 0.05)',
              marginBottom: '12px'
            }}
          >
            <View style={{ display: 'flex', flexDirection: 'row', marginBottom: '10px' }}>
              <Image
                src='https://via.placeholder.com/40x40.png?text=%F0%9F%91%A5'
                style={{ width: '40px', height: '40px', borderRadius: '20px', marginRight: '10px' }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>
                  话题标题 {i}
                </Text>
                <View style={{ marginTop: '4px' }}>
                  <Text style={{ fontSize: '12px', color: '#64748B' }}>
                    这里是话题的简短描述，分享你的观点与灵感。
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={{
                display: 'inline-flex',
                padding: '4px 8px',
                borderRadius: '999px',
                backgroundColor: '#EFF6FF'
              }}
            >
              <Text style={{ color: '#3B82F6', fontSize: '11px' }}>置顶推荐</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

